namespace ReliabilityModel.Model.Formatters.Filtering
{
    public abstract class StateFilteringStrategy
    {
        public abstract bool IncludeState(SystemState systemState);
    }
}