namespace ReliabilityModel.Model.Formatters.Filtering
{
    public class NonTerminalStatesFilteringStrategy : StateFilteringStrategy
    {
        public override bool IncludeState(SystemState systemState) => !systemState.IsTerminal;
    }
}